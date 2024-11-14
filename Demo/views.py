from django.shortcuts import render, redirect
from django.http import HttpResponse

def home(request):
    return render(request, 'game.html')

from django.shortcuts import render, redirect
from django.http import JsonResponse

def start(request):
    return render(request, 'pages/start.html')

def win0(request):
    return render(request, 'pages/win0.html')

def win5(request):
    return render(request, 'pages/win5.html')

def win15(request):
    return render(request, 'pages/win15.html')

def win20(request):
    return render(request, 'pages/win20.html')

def win25(request):
    return render(request, 'pages/win25.html')

