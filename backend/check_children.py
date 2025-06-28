import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Child

print("Checking children in database...")
children = Child.objects.all()
print(f"Total children: {children.count()}")

for child in children:
    print(f"\nChild: {child.name}")
    print(f"  Number: {child.child_number}")
    print(f"  Photo: {child.photo}")
    if child.photo:
        print(f"  Photo name: {child.photo.name}")
        print(f"  Photo URL: {child.photo.url}")
    else:
        print("  No photo") 