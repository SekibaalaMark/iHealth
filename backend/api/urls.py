from django.urls import path
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('medical-bills-sum/',CDOBillingSummaryAPIView.as_view(),name='bill_summary'),
    path('login/', login, name='login'),
    path('register/',UserRegistrationView.as_view(),name='signup'),
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
    path('create-medical-bill/',MedicalRecordCreateAPIView.as_view(),name='medical-bill-creation'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/cdo/medical-records/', MedicalRecordsForCDO.as_view(), name='cdo-medical-records'),
]




