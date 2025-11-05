# api/serializers.py
from rest_framework import serializers
from .models import Cliente, Produto, Venda
from django.contrib.auth.models import User

# Serializer do Usuário (para o histórico de vendas)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

# (4) Serializer de Cliente
class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

# (3) Serializer de Produto + Validações
class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = '__all__'

    def validate_preco(self, value):
        if value <= 0:
            raise serializers.ValidationError("Preço deve ser maior que zero.")
        return value

    def validate_quantidade(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantidade deve ser maior ou igual a zero.")
        return value

# (5) Serializer de Venda (Escrita) - COM A CORREÇÃO
class VendaCreateSerializer(serializers.ModelSerializer):
    # Torna o campo 'cliente' opcional e aceita 'null'
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Venda
        fields = ['cliente', 'produto', 'quantidade', 'data_venda']

# (5) Serializer de Venda (Leitura) - A CLASSE QUE ESTAVA FALTANDO
class VendaReadSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    produto = ProdutoSerializer(read_only=True)
    usuario = UserSerializer(read_only=True) 

    class Meta:
        model = Venda
        fields = '__all__'