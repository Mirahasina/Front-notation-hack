from .models import AuditLog

def log_action(user, action, target_type, target_id=None, changes=None):

    try:
        AuditLog.objects.create(
            user=user if user and user.is_authenticated else None,
            action=action,
            target_type=target_type,
            target_id=str(target_id) if target_id else None,
            changes=changes or {}
        )
    except Exception as e:
        print(f"Error logging audit action: {e}")
