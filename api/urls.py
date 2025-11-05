# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView, # (1) View de Login
    TokenRefreshView,
)
from . import views

# O Router cria as URLs de CRUD (GET, POST, PUT, DELETE) automaticamente
router = DefaultRouter()
router.register(r'clientes', views.ClienteViewSet)
router.register(r'produtos', views.ProdutoViewSet)
router.register(r'vendas', views.VendaViewSet, basename='venda')

urlpatterns = [
    # URLs dos ViewSets
    path('', include(router.urls)),
    
    # (1) URLs de Autenticação
    # /api/token/ (para login)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # /api/token/refresh/ (para renovar o token)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]