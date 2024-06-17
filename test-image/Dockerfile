FROM amazon/aws-cli:2.16.7

RUN yum -y install jq

COPY run-tests.sh /

ENTRYPOINT ["/run-tests.sh"]
