package com.example.SOWDashboard;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository // Marks this interface as a Spring Data JPA repository
public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {
    // JpaRepository provides standard CRUD operations (save, findById, findAll, delete, etc.)
    // You can add custom query methods here if needed, e.g.:
    List<Opportunity> findByStatus(String status);
    List<Opportunity> findByPartner(String partner);
}

