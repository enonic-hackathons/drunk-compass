FROM enonic/java8

ENV XP_HOME /dest
ADD . /src
WORKDIR /src
RUN chmod +x gradlew
CMD ./gradlew deploy
