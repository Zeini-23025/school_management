<!-- cSpell:disable -->
# Quick Start Guide

## ✅ Installed Successfully!

All requirements are installed in the virtual environment.

## 🚀 How to Run the Project

### 1. Activate the Virtual Environment

**Linux/Mac:**
```bash
cd backend
source venv/bin/activate
```

### 2. Check the .env File

Make sure a `.env` file exists in the `backend/` folder:
```powershell
# If it's not present, copy it from the template:
cp env_template.txt .env
```

Then edit the values in `.env` as needed.

### 3. Run Migrations

```powershell
cd school_backend
python manage.py migrate
```

### 4. Create a Superuser (Optional)

```powershell
python manage.py createsuperuser
```

### 5. Run the Server

```powershell
python manage.py runserver
```

The server will run at: `http://127.0.0.1:8000`

## 📝 Important Notes

### Always Use the Virtual Environment

**❌ Incorrect:**
```powershell
pip install -r requirements.txt  # Installs to the global system
```

**✅ Correct:**
```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
# Or after activating the venv:
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```


## 🔧 Troubleshooting

### Issue: "django-admin.exe is in use"

Solution: use the virtual environment instead of the global Python:
```powershell
.\venv\Scripts\python.exe manage.py [command]
```


### Issue: "Could not load .env file"

Solution: make sure the `.env` file exists in the `backend/` folder:
```powershell
cd backend
cp env_template.txt .env
```

## 📚 Useful Commands

```bash
# Activate venv
source venv/bin/activate


# Install a new package
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt

# Run migrations
python manage.py migrate

# Create new migrations
python manage.py makemigrations

# Run the server
python manage.py runserver

# Check the project
python manage.py check
```
## 🎯 Next Steps

1. ✅ Requirements installed
2. ✅ .env file created
3. ⏭️ Run migrations
4. ⏭️ Create a superuser
5. ⏭️ Start the server

<!-- cSpell:enable -->
5. ⏭️ Start the server


