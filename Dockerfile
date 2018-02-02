FROM enonic/java8


ADD . /src

CMD ./gradlew build
