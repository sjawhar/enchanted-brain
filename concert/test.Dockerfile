FROM lambci/lambda:build-python3.7
ENV PYTHONPATH /opt/python

COPY app/Pipfile app/Pipfile.lock ./
RUN pip install six \
 && pipenv install --dev

COPY app .
COPY app/src/layer/python /opt/python

CMD ["pipenv", "run", "test"]
