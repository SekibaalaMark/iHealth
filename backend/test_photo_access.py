#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Child

def test_photo_access():
    print("Testing photo access...")
    
    children = Child.objects.all()
    print(f"Total children in database: {children.count()}")
    
    for child in children:
        print(f"\nChild: {child.name}")
        print(f"  Number: {child.child_number}")
        print(f"  Photo field: {child.photo}")
        
        if child.photo:
            print(f"  Photo name: {child.photo.name}")
            print(f"  Photo URL: {child.photo.url}")
            
            # Check if file exists
            if hasattr(child.photo, 'path'):
                file_path = child.photo.path
                print(f"  File path: {file_path}")
                print(f"  File exists: {os.path.exists(file_path)}")
            else:
                print(f"  No path attribute")
                
            # Try to construct URL manually
            if hasattr(child.photo, 'name') and child.photo.name:
                manual_url = f"/media/{child.photo.name}"
                print(f"  Manual URL: {manual_url}")
                
                # Check if this matches what Django returns
                django_url = child.photo.url
                print(f"  Django URL: {django_url}")
                print(f"  URLs match: {manual_url == django_url}")
        else:
            print("  No photo")

if __name__ == "__main__":
    test_photo_access() 