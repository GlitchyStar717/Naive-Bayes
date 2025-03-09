from django.apps import AppConfig
import threading
import time


class GetinferenceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'getInference'

    def ready(self):
        from .model_utils import train_model
        threading.Thread(target=train_model,daemon = True).start()