from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import *
from rest_framework import generics, status
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterUserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response({
            "message": "User registered successfully.",
            "user": {
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "center_number": user.center_number
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



from rest_framework.views import APIView
from rest_framework import status, permissions
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


from rest_framework.permissions import BasePermission

class IsHospitalUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'Hospital'


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



from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework.permissions import IsAuthenticated
from datetime import date
class CDOBillingSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        if user.role != 'CDO':
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




class LoginAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
