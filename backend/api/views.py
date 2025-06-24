from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import *
from rest_framework import generics, status, permissions
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.permissions import BasePermission
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework.permissions import IsAuthenticated
from datetime import date
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
import random
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegistrationSerializer
from .models import CustomUser
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class UserRegistrationView(APIView):
    permission_classes = [AllowAny]  # Add this line - this is crucial!
    
    def post(self, request):
        logger.info(f"Registration request received")
        logger.info(f"Request data: {request.data}")
        
        try:
            data = request.data 
            serializer = UserRegistrationSerializer(data=data)
            
            if serializer.is_valid():
                validated_data = serializer.validated_data
                password = validated_data.pop('password')
                validated_data.pop('password2')
                
                # Generate 6-digit confirmation code
                confirmation_code = str(random.randint(100000, 999999))
                
                # Create the user with the code and inactive status
                user = CustomUser(**validated_data)
                user.set_password(password)
                user.confirmation_code = confirmation_code
                user.reset_code_sent_at = timezone.now()
                user.is_verified = False
                user.save()
                
                logger.info(f"User created: {user.email}")
                
                # Send the confirmation code via email
                try:
                    send_mail(
                        subject='Your Confirmation Code',
                        message=f'Your confirmation code is: {confirmation_code}',
                        from_email=settings.EMAIL_HOST_USER,
                        recipient_list=[user.email],
                        fail_silently=False,
                    )
                    logger.info(f"Confirmation email sent to: {user.email}")
                except Exception as email_error:
                    logger.error(f"Email sending failed: {str(email_error)}")
                    # Don't fail registration if email fails
                    pass
                
                return Response({
                    "message": "User created successfully. Check your email for the confirmation code.",
                    "email": user.email
                }, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Serializer validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Registration error: {str(e)}", exc_info=True)
            return Response({
                "error": "Registration failed",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

'''
class UserRegistrationView(APIView):
    def post(self, request):
        data = request.data 
        serializer = UserRegistrationSerializer(data=data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            password = validated_data.pop('password')
            validated_data.pop('password2')

            # Generate 6-digit confirmation code
            confirmation_code = str(random.randint(100000, 999999))

            # Create the user with the code and inactive status
            user = CustomUser(**validated_data)
            user.set_password(password)
            user.confirmation_code = confirmation_code
            user.reset_code_sent_at = timezone.now()
            user.is_verified = False
            user.save()

            # Send the confirmation code via email
            send_mail(
                subject='Your Confirmation Code',
                message=f'Your confirmation code is: {confirmation_code}',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response({
                "message": "User created successfully. Check your email for the confirmation code.",
                "email": user.email
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
'''

# views.py
from datetime import timedelta
from django.utils import timezone

class ConfirmEmailView(APIView):
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        try:
            user = CustomUser.objects.get(email=email)

            # Check if code matches
            if user.confirmation_code != code:
                return Response({'error': 'Invalid confirmation code.'}, status=400)

            # Check expiry (30 minutes)
            if not user.reset_code_sent_at or timezone.now() > user.reset_code_sent_at + timedelta(minutes=30):
                return Response({'error': 'This confirmation code has expired. Please request a new one.'}, status=400)
            # Confirm email
            user.is_verified = True
            user.confirmation_code = None
            user.reset_code_sent_at = None
            user.save()

            return Response({'message': 'Email confirmed successfully.'})

        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)




@api_view(['POST'])
@permission_classes([AllowAny])  # Allow anyone to access this view
def login(request):
    serializer = LoginSerializer2(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_verified == True:
        # Generate tokens
                refresh = RefreshToken.for_user(user)
            
                return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'success': True,
                'data':{
                'authenticated':True,
                    'role':user.role,'email':user.email,'username':user.username
                },

                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
            else:
                return Response({'success':False,'message':'verify your email','authenticated':False},status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'success': False, 'message': 'Invalid credentials','authenticated':False}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)







class IsCDOHealth(permissions.BasePermission):
    """
    Allow access only to users with the 'CDO_HEALTH' role.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'CDO_HEALTH'

class CreateChildAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCDOHealth]

    def post(self, request):
        data = request.data.copy()
        data['center_number'] = request.user.center_number  # Force center_number from logged-in user

        serializer = ChildSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class IsHospitalUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'Hospital'


from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags




class MedicalRecordCreateAPIView(APIView):
    permission_classes = [IsHospitalUser]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'Hospital':
            return Response({"detail": "You are not authorized to perform this action."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = MedicalRecordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            medical_record = serializer.save()

            # Get child's center_number
            child = medical_record.child
            center_number = child.center_number

            # Find CDO_HEALTH assigned to this center
            try:
                cdo = CustomUser.objects.get(role='CDO_HEALTH', center_number=center_number)
            except CustomUser.DoesNotExist:
                return Response({
                    "detail": f"No CDO_HEALTH found for center {center_number}."
                }, status=status.HTTP_404_NOT_FOUND)

            # Email content setup
            subject = "New Medical Record Submitted"
            message = f'''
                New Medical Record
                {child.name} {child.child_number} has been admitted at {request.user.username}, on {medical_record.date_of_visit}
                Suffering from {medical_record.disease_description}
                Medical bill : {medical_record.hospital_bill}UGX.
                Mobile CDO health
                Thank you
                please don't reply to this Email
            '''



            send_mail(
                    subject,
                    message,  # plain text message (required)
                    settings.EMAIL_HOST_USER,
                    [cdo.email],
                    fail_silently=False
                    )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

"""
    fields = ['id', 'child_number', 'child', 'hospital', 'disease_description', 'hospital_bill']
        read_only_fields = ['child', 'hospital','date_of_visit']
        extra_kwargs={
            'child_number':{'required':True},
            'disease_description':{'required':True},
            'hospital_bill':{'required':True}
        }

"""

'''
class MedicalRecordCreateAPIView(APIView):
    permission_classes = [IsHospitalUser]

    def post(self, request, *args, **kwargs):
        # Ensure only users with the Hospital role can access
        if request.user.role != 'Hospital':
            return Response({"detail": "You are not authorized to perform this action."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = MedicalRecordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()  # This calls the create method of the serializer
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
'''




class ChildVerificationAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'Hospital':
            return Response({"detail": "Only hospital users can verify child numbers."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = ChildVerificationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class CDOBillingSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        if user.role != 'CDO_HEALTH':
            return Response({"detail": "Access denied. Only CDOs can view billing summary."}, status=403)

        current_year = date.today().year

        # All medical records for this CDO's center and this year
        records = MedicalRecord.objects.filter(
            child__center_number=user.center_number,
            date_of_visit__year=current_year
        )

        # Total for the whole year
        total_yearly_bill = records.aggregate(total=Sum('hospital_bill'))['total'] or 0

        # Group by month
        monthly_totals = (
            records
            .annotate(month=TruncMonth('date_of_visit'))
            .values('month')
            .annotate(total=Sum('hospital_bill'))
            .order_by('month')
        )

        # Format response
        monthly_data = {
            entry['month'].strftime('%B'): entry['total']
            for entry in monthly_totals
        }

        return Response({
            "year": current_year,
            "total_yearly_bill": total_yearly_bill,
            "monthly_totals": monthly_data
        })


class MedicalRecordListAPIView(APIView):
    permission_classes = [IsCDOHealth]

    def get(self, request):
        center_number = request.user.center_number
        medical_records = MedicalRecord.objects.filter(child__center_number=center_number)
        serializer = MedicalRecordListSerializer(medical_records, many=True)
        return Response(serializer.data)


from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class YearDiseaseStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != 'CDO_HEALTH':
            return Response({"detail": "Only CDO_HEALTH users can access this data."}, status=403)

        center_number = user.center_number

        # Filter by child's center number and group by disease
        stats = (
            MedicalRecord.objects
            .filter(child__center_number=center_number)
            .values('disease_description')
            .annotate(count=Count('disease_description'))
            .order_by('-count')
        )

        return Response({
            "center": center_number,
            "total_diseases_reported": sum(item['count'] for item in stats),
            "disease_statistics": stats
        })



from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class MonthDiseaseStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != 'CDO_HEALTH':
            return Response({"detail": "Only CDO_HEALTH users can access this data."}, status=403)

        center_number = user.center_number

        # Filter by child's center number and group by disease
        stats = (
            MedicalRecord.objects
            .filter(child__center_number=center_number)
            .values('disease_description')
            .annotate(count=Count('disease_description'))
            .order_by('-count')
        )

        return Response({
            "center": center_number,
            "total_diseases_reported": sum(item['count'] for item in stats),
            "disease_statistics": stats
        })




class DeleteChildView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, child_number):
        user = request.user

        if user.role != 'CDO_HEALTH':
            return Response({"detail": "You are not authorized to delete children."}, status=status.HTTP_403_FORBIDDEN)

        try:
            child = Child.objects.get(child_number=child_number)
        except Child.DoesNotExist:
            return Response({"detail": "Child not found."}, status=status.HTTP_404_NOT_FOUND)

        if child.center_number != user.center_number:
            return Response({"detail": "You can only delete children from your own center."}, status=status.HTTP_403_FORBIDDEN)

        child.delete()
        return Response({"message": "Child deleted successfully."}, status=status.HTTP_204_NO_CONTENT)




class UpdateChildView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, child_number):
        user = request.user

        if user.role != 'CDO_HEALTH':
            return Response({"detail": "You are not authorized to update children."}, status=status.HTTP_403_FORBIDDEN)

        try:
            child = Child.objects.get(child_number=child_number)
        except Child.DoesNotExist:
            return Response({"detail": "Child not found."}, status=status.HTTP_404_NOT_FOUND)

        if child.center_number != user.center_number:
            return Response({"detail": "You can only update children from your own center."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ChildUpdateSerializer(child, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Child updated successfully.", "child": serializer.data}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ResendConfirmationCodeView(APIView):
    def post(self, request):
        serializer = ResendConfirmationCodeSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = CustomUser.objects.get(email=email)

            # Generate a new confirmation code
            confirmation_code = str(random.randint(100000, 999999))
            user.confirmation_code = confirmation_code
            user.reset_code_sent_at = timezone.now()
            user.save()

            # Send confirmation code via email
            send_mail(
                subject='Your New Confirmation Code',
                message=f'Your new confirmation code is: {confirmation_code}',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({
                "message": "Confirmation code resent. Please check your email.",
                "email": email
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# views.py
class RequestPasswordResetView(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = CustomUser.objects.get(email=email)

            # Generate reset code
            reset_code = str(random.randint(100000, 999999))
            user.confirmation_code = reset_code  # reuse this field
            user.reset_code_sent_at = timezone.now()
            user.save()

            # Send email
            send_mail(
                subject='Password Reset Code',
                message=f'Your password reset code is: {reset_code}',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({"message": "Reset code sent to email."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ResetPasswordView(APIView):
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"error": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Password changed successfully."})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class ResendPasswordResetCodeView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            user = CustomUser.objects.get(email=email)
            # Only allow resending if not verified or not recently reset

            confirmation_code = str(random.randint(100000, 999999))
            user.confirmation_code = confirmation_code
            user.reset_code_sent_at = timezone.now()
            user.save()

            send_mail(
                subject="Your New Password Reset Code",
                message=f"Here is your new password reset code: {confirmation_code}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False
            )
            return Response({"message": "A new password reset code has been sent to your email."}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "No account with this email exists."}, status=status.HTTP_404_NOT_FOUND)
