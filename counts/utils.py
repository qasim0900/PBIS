from decimal import Decimal, ROUND_HALF_UP, ROUND_UP


# ------------------------------------------
# :: cell decimal function
# ------------------------------------------

"""
Round a Decimal value up to the nearest whole number.
"""


def ceil_decimal(value: Decimal) -> Decimal:
    return value.to_integral_value(rounding=ROUND_UP)


# ------------------------------------------
# :: calculate order quantity function
# ------------------------------------------

"""
Calculate quantity needed to reach par level.
"""


def calculate_order_quantity(par_level: Decimal, current_count: Decimal) -> Decimal:
    qty = par_level - current_count
    return max(Decimal("0"), qty).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


# ------------------------------------------
# :: calculate order units function
# ------------------------------------------
"""
Calculate order units from quantity, accounting for pack size and minimum.
"""


def calculate_order_units(
    quantity: Decimal, pack_size: Decimal, min_order_qty: Decimal = None
) -> Decimal:
    if pack_size <= 0:
        return Decimal("0")

    units = quantity / pack_size
    units = ceil_decimal(units)

    if min_order_qty:
        units = max(units, ceil_decimal(min_order_qty))

    return units


# ------------------------------------------
# :: get inventory status Function
# ------------------------------------------
"""
Determine inventory status: critical, warning, or ok.
"""


def get_inventory_status(current_count: Decimal, order_point: Decimal, par_level: Decimal) -> str:
    if current_count <= order_point:
        return "critical"
    elif current_count <= par_level:
        return "warning"
    return "ok"


# ------------------------------------------
# :: get effective vendor function
# ------------------------------------------
"""
Get vendor from override or fallback to item vendor.
"""


def get_effective_vendor(override, item):
    if override and override.vendor:
        return override.vendor
    return override.vendor or item.vendor
