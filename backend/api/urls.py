from django.urls import path
from .views import *

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register-user'),
    path('create-medical-bill/', MedicalRecordCreateAPIView.as_view(), name='create-medical-record'),
    path('medical-bills-sum/',CDOBillingSummaryAPIView.as_view(),name='bill_summary'),
    path('login/', login, name='login'),
    path('create-child/',CreateChildAPIView.as_view(),name='create-child'),
    path('verify-child/',ChildVerificationAPIView.as_view(),name='verify-child'),
    path('medical-records/',MedicalRecordListAPIView.as_view(),name='medical_lists'),
]
