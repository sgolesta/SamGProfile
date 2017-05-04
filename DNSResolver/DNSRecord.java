public class DNSRecord {
    // instance variables
    private String domainName;
    private int type;
    private int RDataClass;
    private int ttl;
    private int RDLength;
    private String RData;

    public DNSRecord(String domainName, int type, int RDataClass, int ttl) {
        // constructor
        this.domainName = domainName;
        this.type = type;
        this.RDataClass = RDataClass;
        this.ttl = ttl;
        this.RDLength = 0;
        this.RData = " ";
    }

    // methods
    public String getDomainName() {
        return this.domainName;
    }

    public int getType() {
        return this.type;
    }

    public int getRClass() {
        return this.RDataClass;
    }

    public int getTTL() {
        return this.ttl;
    }

    public int getRDLength() {
        return this.RDLength;
    }

    public String getRData() {
        return this.RData;
    }

    public void setRDLength(int RDLength){
        this.RDLength = RDLength;
    }
    public void setRData(String RData){
        this.RData = RData;
    }

}
