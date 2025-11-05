from django.shortcuts import render

# Create your views here.
# api/views.py
from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction # Para garantir a lógica de estoque
from .models import Cliente, Produto, Venda
from .serializers import (
    ClienteSerializer, 
    ProdutoSerializer, 
    VendaCreateSerializer,
    VendaReadSerializer
)

# (4) View de Clientes (CRUD + Busca)
class ClienteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated] # (1) Só acessa se logado
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    
    # (4) Busca por nome
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome']

# (3) View de Produtos (CRUD + Busca + Ordenação)
class ProdutoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    
    # (3) Busca por nome
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome']
    
    # (5) Ordenação por nome (para a tela de vendas)
    ordering_fields = ['nome']
    ordering = ['nome'] # Padrão é ordem alfabética

# (5) View de Vendas (Lógica de Negócio)

# (5) View de Vendas (Lógica de Negócio)
class VendaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    # ESTA É A LINHA QUE ADICIONAMOS, AGORA COM A INDENTAÇÃO CORRETA
    queryset = Venda.objects.all().order_by('-data_venda') # Ordena da mais nova para a mais antiga

    
    def get_serializer_class(self):
        if self.action == 'create':
            return VendaCreateSerializer
        return VendaReadSerializer

    # Sobrescreve o método de CRIAÇÃO para adicionar nossa lógica
    @transaction.atomic # Garante a integridade da transação
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True) # Valida os dados

        # Pegamos os dados validados
        produto = serializer.validated_data['produto']
        quantidade_vendida = serializer.validated_data['quantidade']

        # (5) Lógica de Negócio: Verificação de Estoque
        if produto.quantidade < quantidade_vendida:
            # (5) Bloqueia a venda e retorna erro
            return Response(
                {"erro": f"Estoque insuficiente. Disponível: {produto.quantidade}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # (5) Lógica de Negócio: Calcular Total
        valor_total = produto.preco * quantidade_vendida

        # (5) Lógica de Negócio: Efetivar Venda e Atualizar Estoque
        produto.quantidade -= quantidade_vendida
        produto.save() # Salva a nova quantidade no banco

        # Cria a venda no banco
        venda = Venda.objects.create(
            cliente=serializer.validated_data.get('cliente'), # Use .get() para cliente opcional
            produto=produto,
            quantidade=quantidade_vendida,
            data_venda=serializer.validated_data['data_venda'],
            valor_total=valor_total,
            usuario=request.user # (1) Pega o usuário logado
        )
        
        # (5) Exibir Resumo (retorna a venda criada com todos os detalhes)
        read_serializer = VendaReadSerializer(venda)
        headers = self.get_success_headers(read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)