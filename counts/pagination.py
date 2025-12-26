from typing import Optional
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

# -----------------------------------
# :: Ten Per Page Pagination Class
# -----------------------------------

"""
It is a custom DRF pagination class that returns paginated data with a customised response format.
"""


class TenPerPagePagination(PageNumberPagination):
    page_size: int = 10
    page_size_query_param: str = "page_size"
    max_page_size: int = 100

    # -----------------------------------
    # :: Get Paginated Response Function
    # -----------------------------------

    """
    This method returns a custom paginated API response with metadata and results.
    """

    def get_paginated_response(self, data) -> Response:
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

    # -----------------------------------
    # :: get page size Function
    # -----------------------------------

    """
    This method determines the page size, enforcing a maximum limit and falling back to the default when needed.
    """

    def get_page_size(self, request: Optional[Request]) -> int:
        if request is None:
            return self.page_size
        page_size = super().get_page_size(request)
        if page_size and page_size > self.max_page_size:
            return self.max_page_size
        return page_size or self.page_size
