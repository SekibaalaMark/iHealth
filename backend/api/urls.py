from django.urls import path
from .views import *

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register-user'),
    path('medical-records/create/', MedicalRecordCreateAPIView.as_view(), name='create-medical-record'),
]
