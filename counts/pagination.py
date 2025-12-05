from typing import Optional
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response


class TenPerPagePagination(PageNumberPagination):
    """
    Custom pagination class:
    - Default page size: 10
    - Clients can override with 'page_size' query param, up to max_page_size
    - Max page size: 100
    """

    page_size: int = 10
    page_size_query_param: str = "page_size"
    max_page_size: int = 100

    def get_paginated_response(self, data) -> Response:
        """
        Returns a paginated response with metadata.
        Includes total count, total pages, current page, next/previous links.
        """
        return Response(
            {
                "count": self.page.paginator.count,
                "total_pages": self.page.paginator.num_pages,
                "current_page": self.page.number,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )

    def get_page_size(self, request: Optional[Request]) -> int:
        """
        Returns the requested page size, respecting the max_page_size limit.
        """
        if request is None:
            return self.page_size
        page_size = super().get_page_size(request)
        if page_size and page_size > self.max_page_size:
            return self.max_page_size
        return page_size or self.page_size
