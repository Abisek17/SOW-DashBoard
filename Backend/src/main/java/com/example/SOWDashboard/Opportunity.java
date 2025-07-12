package com.example.SOWDashboard;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity // Marks this class as a JPA entity
@Table(name = "opportunities") // Specifies the table name in the database
public class Opportunity {

    @Id // Marks this field as the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increments the ID
    private Long id;

    @Column(name = "project_name", nullable = false) // Maps to a column named 'project_name', cannot be null
    private String projectName;

    @Column(name = "partner", nullable = false)
    private String partner;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "progress")
    private String progress; // e.g., "50%", "75%"

    @Column(name = "sales_rep")
    private String salesRep;

    @Column(name = "end_customer")
    private String endCustomer;

    @Column(name = "category")
    private String category;

    @Column(name = "subject")
    private String subject;

    @Column(name = "type")
    private String type;

    @Column(name = "status")
    private String status; // e.g., "Awarded", "Rejected", "On Negotiation"

    // Default constructor (required by JPA)
    public Opportunity() {
    }

    // Constructor with fields
    public Opportunity(String projectName, String partner, LocalDateTime createdDate, String progress,
                       String salesRep, String endCustomer, String category, String subject,
                       String type, String status) {
        this.projectName = projectName;
        this.partner = partner;
        this.createdDate = createdDate;
        this.progress = progress;
        this.salesRep = salesRep;
        this.endCustomer = endCustomer;
        this.category = category;
        this.subject = subject;
        this.type = type;
        this.status = status;
    }

    // Getters and Setters for all fields

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getPartner() {
        return partner;
    }

    public void setPartner(String partner) {
        this.partner = partner;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getProgress() {
        return progress;
    }

    public void setProgress(String progress) {
        this.progress = progress;
    }

    public String getSalesRep() {
        return salesRep;
    }

    public void setSalesRep(String salesRep) {
        this.salesRep = salesRep;
    }

    public String getEndCustomer() {
        return endCustomer;
    }

    public void setEndCustomer(String endCustomer) {
        this.endCustomer = endCustomer;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @PrePersist // Method to be called before persisting a new entity
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now(); // Set creation date if not already set
        }
    }
}
