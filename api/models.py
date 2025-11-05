from django.db import models

# Create your models here.
# api/models.py
from django.db import models
from django.contrib.auth.models import User # (1) Autenticação de Usuário

# (4) Cadastro de Cliente
class Cliente(models.Model):
    nome = models.CharField(max_length=100)
    telefone = models.CharField(max_length=20, blank=True)
    # O EmailField já faz a validação de email (@ e .)
    email = models.EmailField(unique=True, max_length=100)

    def __str__(self):
        return self.nome

# (3) Cadastro de Produto
class Produto(models.Model):
    nome = models.CharField(max_length=100, blank=False, null=False) # Não pode ser vazio
    categoria = models.CharField(max_length=50, blank=True)
    # Validação (maior que zero) será feita no Serializer
    preco = models.DecimalField(max_digits=10, decimal_places=2) 
    # Validação (>= 0) será feita no Serializer
    quantidade = models.IntegerField() # Quantidade em estoque

    def __str__(self):
        return self.nome

# (5) Gestão de Vendas
class Venda(models.Model):
    # se o cliente for deletado, a venda fica sem cliente (SET_NULL)
    cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True)
    # se o produto for deletado, a venda NÃO pode ser deletada (PROTECT)
    produto = models.ForeignKey(Produto, on_delete=models.PROTECT)
    quantidade = models.IntegerField()
    data_venda = models.DateTimeField()
    valor_total = models.DecimalField(max_digits=10, decimal_places=2)
    # Quem fez a venda
    usuario = models.ForeignKey(User, on_delete=models.PROTECT) 

    def __str__(self):
        return f"Venda #{self.id} - {self.produto.nome}"