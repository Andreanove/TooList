set -eu

python3 -m venv .buildenv
.buildenv/bin/python -m pip install -r requirements.txt
.buildenv/bin/python manage.py collectstatic --noinput