# School Management Project

## Description

Le projet **School Management** est une application web pour gérer les écoles, incluant la gestion des étudiants, enseignants, classes, et présences. Il est conçu pour être modulaire et extensible, utilisant **Django** pour le backend et **React + Vite + TypeScript** pour le frontend.

## Technologies utilisées

* **Backend** : Python, Django, Django REST Framework (DRF), django-cors-headers
* **Frontend** : React, Vite, TypeScript
* **Gestion de dépendances** : virtualenv pour Python, npm pour Node.js
* **Base de données** : SQLite par défaut (peut être remplacée par PostgreSQL ou MySQL)
* **Contrôle de version** : Git

## Structure du projet

```
school_management/
│
├── venv/                   # Environnement virtuel Python
│
├── backend/                # Backend Django
│   ├── backend/            # Paramètres du projet Django
│   ├── api/                # App principale avec modèles et API
│   └── requirements.txt    # Liste des packages Python installés
│
└── frontend/               # Frontend React + Vite + TypeScript
└── src/                # Composants et pages React

```

## Comment développer et exécuter le projet

### 1. Préparer l'environnement backend

1. Créer et activer l'environnement virtuel Python :

```bash
python -m venv venv
# mac/linux
source venv/bin/activate
# windows
venv\Scripts\activate
```

2. Installer les dépendances du backend :

```bash
cd backend
pip install -r requirements.txt
```

### 2. Lancer le serveur Django

```bash
python manage.py runserver
```

Le backend sera accessible sur `http://127.0.0.1:8000/`.

---

### 3. Préparer et lancer le frontend

1. Aller dans le dossier frontend :

```bash
cd frontend
```

2. Installer les dépendances Node.js :

```bash
npm install
```

3. Lancer le serveur de développement :

```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173/` (ou autre port affiché par Vite).

---

### 4. Ajouter de nouvelles dépendances

* Pour le backend Python :

```bash
pip install <package>
pip freeze > requirements.txt
```

* Pour le frontend Node.js :

```bash
npm install <package>
```

---

### 5. Bonnes pratiques

* Toujours activer l'environnement virtuel avant de travailler sur le backend.
* Commiter régulièrement vos modifications avec des messages clairs.
* Séparer clairement backend et frontend pour faciliter le développement et la maintenance.

---

Cette configuration permet de démarrer rapidement le développement, d’ajouter de nouvelles fonctionnalités et de maintenir le projet organisé.
