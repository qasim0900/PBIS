from decimal import Decimal
from django.dispatch import receiver
from .models import CountEntry, CountEntryAudit
from django.db.models.signals import post_save, pre_save


# -----------------------------------
# :: Cache Previous on hand Function
# -----------------------------------

"""
Caches the previous on_hand_quantity of a CountEntry before it's saved, allowing tracking of changes.
"""


@receiver(pre_save, sender=CountEntry)
def cache_previous_on_hand(sender, instance: CountEntry, **kwargs):
    if not instance.pk:
        return
    try:
        previous = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    if previous.on_hand_quantity != instance.on_hand_quantity:
        instance._previous_on_hand = previous.on_hand_quantity


# --------------------------------------
# :: Create Count Entry Audit Function
# --------------------------------------
"""
Creates an audit record for a CountEntry after it's saved, logging initial or changed on_hand_quantity values.
"""


@receiver(post_save, sender=CountEntry)
def create_count_entry_audit(sender, instance: CountEntry, created: bool, **kwargs):
    if created:
        initial_qty = instance.on_hand_quantity
        if initial_qty and initial_qty > Decimal("0"):
            CountEntryAudit.objects.create(
                entry=instance,
                changed_by=instance.updated_by,
                previous_on_hand=Decimal("0"),
                new_on_hand=initial_qty,
            )
        return

    previous_on_hand = getattr(instance, "_previous_on_hand", None)
    if previous_on_hand is None or previous_on_hand == instance.on_hand_quantity:
        return

    # -----------------------------------
    # :: Create Count Entry Audit
    # -----------------------------------

    """
    Logs a CountEntry change by creating a CountEntryAudit record with the 
    previous and new on-hand quantities and who made the change.
    """

    CountEntryAudit.objects.create(
        entry=instance,
        changed_by=instance.updated_by,
        previous_on_hand=previous_on_hand,
        new_on_hand=instance.on_hand_quantity,
    )
