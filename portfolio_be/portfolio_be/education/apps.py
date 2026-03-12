from django.apps import AppConfig


class EducationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'education'    
    def ready(self):
        # Import signal handlers when app is ready
        import education.models  # noqa