from decimal import Decimal
from django.db import transaction
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import CountEntry, CountEntryAudit


@receiver(pre_save, sender=CountEntry)
def cache_previous_on_hand(sender, instance: CountEntry, **kwargs):
    if not instance.pk:
        return

    # Use only the necessary field to avoid extra DB overhead
    previous = sender.objects.only(
        "on_hand_quantity").filter(pk=instance.pk).first()
    if previous and previous.on_hand_quantity != instance.on_hand_quantity:
        instance._previous_on_hand = previous.on_hand_quantity


@receiver(post_save, sender=CountEntry)
def create_count_entry_audit(sender, instance: CountEntry, created: bool, **kwargs):
    """
    Creates a CountEntryAudit record if on_hand_quantity has changed.
    - For newly created entries: logs initial quantity if > 0
    - For updates: logs previous vs new quantity
    """
    previous_on_hand = getattr(instance, "_previous_on_hand", None)

    # Determine if an audit is needed
    if created:
        initial_qty = instance.on_hand_quantity or Decimal("0")
        if initial_qty > 0:
            CountEntryAudit.objects.create(
                entry=instance,
                changed_by=instance.updated_by,
                previous_on_hand=Decimal("0"),
                new_on_hand=initial_qty,
            )
        return

    # Skip if no change
    if previous_on_hand is None or previous_on_hand == instance.on_hand_quantity:
        return

    # Create audit atomically
    with transaction.atomic():
        CountEntryAudit.objects.create(
            entry=instance,
            changed_by=instance.updated_by,
            previous_on_hand=previous_on_hand,
            new_on_hand=instance.on_hand_quantity,
        )
