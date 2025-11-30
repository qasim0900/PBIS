import io
from decimal import Decimal, InvalidOperation
from django.http import HttpResponse
from rest_framework import filters, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

from .models import CatalogItem, ItemCategory
from .serializers import CatalogItemSerializer


class CatalogItemViewSet(viewsets.ModelViewSet):
    serializer_class = CatalogItemSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("name", "category", "notes")
    ordering_fields = ("name", "category", "updated_at")
    ordering = ("name",)
    parser_classes = (FormParser,MultiPartParser, JSONParser)

    def get_queryset(self):
        queryset = CatalogItem.objects.all()
        active = self.request.query_params.get("active")
        if active is not None:
            if active.lower() in {"1", "true", "yes", "y"}:
                queryset = queryset.filter(is_active=True)
            elif active.lower() in {"0", "false", "no", "n"}:
                queryset = queryset.filter(is_active=False)
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)
        return queryset

    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Catalog Items"

        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="6366F1", end_color="6366F1", fill_type="solid")
        header_alignment = Alignment(horizontal="center", vertical="center")
        thin_border = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )

        headers = ['ID', 'Name', 'Category', 'Count Unit', 'Order Unit', 'Pack Size', 'Is Active', 'Helper Text', 'Notes']
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment
            cell.border = thin_border

        items = CatalogItem.objects.all().order_by('name')
        for row, item in enumerate(items, 2):
            ws.cell(row=row, column=1, value=item.id).border = thin_border
            ws.cell(row=row, column=2, value=item.name).border = thin_border
            ws.cell(row=row, column=3, value=item.category).border = thin_border
            ws.cell(row=row, column=4, value=item.count_unit).border = thin_border
            ws.cell(row=row, column=5, value=item.order_unit).border = thin_border
            ws.cell(row=row, column=6, value=float(item.pack_size)).border = thin_border
            ws.cell(row=row, column=7, value='Yes' if item.is_active else 'No').border = thin_border
            ws.cell(row=row, column=8, value=item.helper_text).border = thin_border
            ws.cell(row=row, column=9, value=item.notes).border = thin_border

        for col in range(1, len(headers) + 1):
            ws.column_dimensions[get_column_letter(col)].width = 18

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="catalog_items.xlsx"'
        return response

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def import_excel(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        excel_file = request.FILES['file']
        
        if not excel_file.name.endswith(('.xlsx', '.xls')):
            return Response({'error': 'File must be an Excel file (.xlsx or .xls)'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            wb = openpyxl.load_workbook(excel_file)
            ws = wb.active

            headers = [cell.value for cell in ws[1]]
            required_headers = ['Name', 'Category', 'Count Unit', 'Order Unit', 'Pack Size']
            
            for required in required_headers:
                if required not in headers:
                    return Response(
                        {'error': f'Missing required column: {required}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            created_count = 0
            updated_count = 0
            errors = []

            valid_categories = [choice[0] for choice in ItemCategory.choices]

            for row_num, row in enumerate(ws.iter_rows(min_row=2, values_only=True), 2):
                if not any(row):
                    continue

                row_dict = dict(zip(headers, row))
                
                name = row_dict.get('Name', '').strip() if row_dict.get('Name') else ''
                if not name:
                    errors.append(f'Row {row_num}: Name is required')
                    continue

                category = row_dict.get('Category', 'other').lower() if row_dict.get('Category') else 'other'
                if category not in valid_categories:
                    category = 'other'

                try:
                    pack_size = Decimal(str(row_dict.get('Pack Size', 1) or 1))
                    if pack_size <= 0:
                        pack_size = Decimal('1')
                except (InvalidOperation, ValueError):
                    pack_size = Decimal('1')

                is_active_value = row_dict.get('Is Active', 'Yes')
                if isinstance(is_active_value, str):
                    is_active = is_active_value.lower() in ['yes', 'true', '1', 'active']
                else:
                    is_active = bool(is_active_value)

                try:
                    item, created = CatalogItem.objects.update_or_create(
                        name=name,
                        defaults={
                            'category': category,
                            'count_unit': row_dict.get('Count Unit', 'each') or 'each',
                            'order_unit': row_dict.get('Order Unit', 'case') or 'case',
                            'pack_size': pack_size,
                            'is_active': is_active,
                            'helper_text': row_dict.get('Helper Text', '') or '',
                            'notes': row_dict.get('Notes', '') or '',
                        }
                    )
                    if created:
                        created_count += 1
                    else:
                        updated_count += 1
                except Exception as e:
                    errors.append(f'Row {row_num}: {str(e)}')

            return Response({
                'success': True,
                'created': created_count,
                'updated': updated_count,
                'errors': errors if errors else None
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def template(self, request):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Template"

        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="6366F1", end_color="6366F1", fill_type="solid")
        header_alignment = Alignment(horizontal="center", vertical="center")
        thin_border = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )

        headers = ['Name', 'Category', 'Count Unit', 'Order Unit', 'Pack Size', 'Is Active', 'Helper Text', 'Notes']
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment
            cell.border = thin_border

        sample_data = [
            ['Sample Item', 'fruit', 'bags', 'cases', 6, 'Yes', '1 case = 6 bags', 'Sample notes'],
        ]
        for row_num, row_data in enumerate(sample_data, 2):
            for col, value in enumerate(row_data, 1):
                cell = ws.cell(row=row_num, column=col, value=value)
                cell.border = thin_border

        instructions = wb.create_sheet("Instructions")
        instructions['A1'] = "Import Instructions"
        instructions['A1'].font = Font(bold=True, size=14)
        
        instruction_text = [
            "",
            "1. Fill in the Template sheet with your catalog items",
            "2. Required fields: Name, Category, Count Unit, Order Unit, Pack Size",
            "3. Category options: fruit, dairy, dry, packaging, other",
            "4. Is Active: Yes/No or True/False",
            "5. Pack Size must be a positive number",
            "6. Save and upload the file",
            "",
            "Note: Items with the same name will be updated, new names will create new items"
        ]
        for row, text in enumerate(instruction_text, 2):
            instructions[f'A{row}'] = text

        instructions.column_dimensions['A'].width = 80

        for col in range(1, len(headers) + 1):
            ws.column_dimensions[get_column_letter(col)].width = 18

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="catalog_import_template.xlsx"'
        return response
