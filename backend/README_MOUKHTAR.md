# Guide d'utilisation - Gestion des élèves (Moukhtar)

## ✅ Tâche terminée

La gestion des élèves a été implémentée avec succès. Voici comment utiliser l'API.

## 🚀 Comment lancer le projet

### 1. Activer l'environnement virtuel (si vous en avez un)

```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 2. Installer les dépendances (si nécessaire)

```bash
cd backend
pip install -r requirements.txt
```

### 3. Appliquer les migrations (si pas déjà fait)

```bash
python manage.py migrate
```

### 4. Créer un superutilisateur (optionnel, pour accéder à l'admin)

```bash
python manage.py createsuperuser
```

### 5. Lancer le serveur Django

```bash
python manage.py runserver
```

Le serveur sera accessible sur : **http://127.0.0.1:8000/**

## 📡 Endpoints disponibles

### Gestion des élèves (`/api/students/`)

- **GET** `/api/students/` - Liste tous les élèves
- **POST** `/api/students/` - Créer un nouvel élève
- **GET** `/api/students/{id}/` - Détails d'un élève
- **PUT** `/api/students/{id}/` - Mettre à jour un élève (complet)
- **PATCH** `/api/students/{id}/` - Mettre à jour un élève (partiel)
- **DELETE** `/api/students/{id}/` - Supprimer un élève

### Recherche et filtrage

- **Recherche par nom** : `GET /api/students/?search=Jean`
- **Filtrage par classe** : `GET /api/students/?classId=1`
- **Combinaison** : `GET /api/students/?search=Jean&classId=1`
- **Tri** : `GET /api/students/?ordering=-birthDate`

### Gestion des classes (`/api/classes/`)

- **GET** `/api/classes/` - Liste toutes les classes
- **POST** `/api/classes/` - Créer une nouvelle classe
- **GET** `/api/classes/{id}/` - Détails d'une classe
- **PUT/PATCH** `/api/classes/{id}/` - Modifier une classe
- **DELETE** `/api/classes/{id}/` - Supprimer une classe

## 📝 Exemple d'utilisation avec cURL

### Créer une classe d'abord

```bash
curl -X POST http://127.0.0.1:8000/api/classes/ \
  -H "Content-Type: application/json" \
  -d '{"name": "6ème A", "level": "6ème"}'
```

### Créer un élève

```bash
curl -X POST http://127.0.0.1:8000/api/students/ \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jean Dupont",
    "birthDate": "2010-05-15",
    "gender": "M",
    "parentPhone": "+221771234567",
    "address": "Dakar, Sénégal",
    "notes": "Élève assidu",
    "classId": 1
  }'
```

### Lister tous les élèves

```bash
curl http://127.0.0.1:8000/api/students/
```

### Rechercher un élève par nom

```bash
curl "http://127.0.0.1:8000/api/students/?search=Jean"
```

### Filtrer par classe

```bash
curl "http://127.0.0.1:8000/api/students/?classId=1"
```

## 🗄️ Structure des données

### Modèle Student

```json
{
  "id": 1,
  "fullName": "Jean Dupont",
  "birthDate": "2010-05-15",
  "gender": "M",
  "parentPhone": "+221771234567",
  "address": "Dakar, Sénégal",
  "notes": "Élève assidu",
  "classId": 1,
  "class_name": "6ème A",
  "created_at": "2025-01-27T10:00:00Z",
  "updated_at": "2025-01-27T10:00:00Z"
}
```

### Modèle Classroom

```json
{
  "id": 1,
  "name": "6ème A",
  "level": "6ème",
  "student_count": 25
}
```

## 🔧 Accès à l'interface d'administration

1. Lancer le serveur : `python manage.py runserver`
2. Aller sur : http://127.0.0.1:8000/admin/
3. Se connecter avec le superutilisateur créé

## 📦 Fichiers créés/modifiés

- ✅ `backend/api/models.py` - Modèles Classroom et Student
- ✅ `backend/api/serializers.py` - Serializers pour l'API
- ✅ `backend/api/views.py` - ViewSets avec recherche et filtrage
- ✅ `backend/api/admin.py` - Configuration admin Django
- ✅ `backend/backend/urls.py` - Routes API
- ✅ `backend/backend/settings.py` - Configuration REST Framework
- ✅ `backend/api/migrations/0001_initial.py` - Migrations de base de données

## 🎯 Fonctionnalités implémentées

- ✅ CRUD complet pour les élèves
- ✅ Recherche par nom (fullName) et téléphone (parentPhone)
- ✅ Filtrage par classe (classId)
- ✅ Tri par différents champs
- ✅ Relation correcte avec Classroom
- ✅ Interface d'administration Django
- ✅ Pagination automatique (20 éléments par page)

