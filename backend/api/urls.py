from django.urls import path
from .views import *

urlpatterns = [
    path('medical-bills-sum/',CDOBillingSummaryAPIView.as_view(),name='bill_summary'),
    path('login/', login, name='login'),
    path('create-child/',CreateChildAPIView.as_view(),name='create-child'),
    path('verify-child/',ChildVerificationAPIView.as_view(),name='verify-child'),
    path('medical-records/',MedicalRecordListAPIView.as_view(),name='medical_lists'),
    path('verify-email/',ConfirmEmailView.as_view(),name='verify-email'),
    path('year-disease-stats/', YearDiseaseStatsAPIView.as_view(), name='disease-stats'),
    path('month-disease-stats/', MonthDiseaseStatsAPIView.as_view(), name='disease-stats'),
    path('delete-child/<str:child_number>/', DeleteChildView.as_view(), name='delete-child'),
    path('update-child/<str:child_number>/', UpdateChildView.as_view(), name='update-child'),
    path('request-password-reset/', RequestPasswordResetView.as_view(), name='request-password-reset'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('change-password/',ChangePasswordView.as_view(),name='change-password'),
    path('resend-password-reset-code/', ResendPasswordResetCodeView.as_view(), name='resend-reset-code'),
    path('resend-confirmation-code/',ResendConfirmationCodeView.as_view(),name='resend-code1'),
]
