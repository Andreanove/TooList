python3 -m venv .buildenv
. .buildenv/bin/activate
pip install -r requirements.txt
python manage.py collectstatic --noinput