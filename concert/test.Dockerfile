FROM lambci/lambda:build-python3.7
COPY app/Pipfile app/Pipfile.lock ./
RUN pipenv install --dev

COPY app .
COPY app/src/layer/python /opt/python

ENV PYTHONPATH /opt/python
CMD ["pipenv", "run", "test"]
