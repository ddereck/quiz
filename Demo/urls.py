from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('start/', views.start, name='start'),
    path('win0/', views.win0, name='win0'),
    path('win5/', views.win5, name='win5'),
    path('win15/', views.win15, name='win15'),
    path('win20/', views.win20, name='win20'),
    path('win25/', views.win25, name='win25'),
]
