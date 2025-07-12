package com.example.SOWDashboard;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service // Marks this class as a Spring service component
public class OpportunityService {

    @Autowired // Injects the OpportunityRepository
    private OpportunityRepository opportunityRepository;

    // Get all opportunities
    public List<Opportunity> getAllOpportunities() {
        return opportunityRepository.findAll();
    }

    // Get opportunity by ID
    public Optional<Opportunity> getOpportunityById(Long id) {
        return opportunityRepository.findById(id);
    }

    // Create a new opportunity
    public Opportunity createOpportunity(Opportunity opportunity) {
        return opportunityRepository.save(opportunity);
    }

    // Update an existing opportunity
    public Opportunity updateOpportunity(Long id, Opportunity opportunityDetails) {
        // Find the existing opportunity by ID
        Optional<Opportunity> optionalOpportunity = opportunityRepository.findById(id);

        if (optionalOpportunity.isPresent()) {
            Opportunity existingOpportunity = optionalOpportunity.get();
            // Update fields from opportunityDetails
            existingOpportunity.setProjectName(opportunityDetails.getProjectName());
            existingOpportunity.setPartner(opportunityDetails.getPartner());
            existingOpportunity.setCreatedDate(opportunityDetails.getCreatedDate()); // Can be updated if needed, or keep original
            existingOpportunity.setProgress(opportunityDetails.getProgress());
            existingOpportunity.setSalesRep(opportunityDetails.getSalesRep());
            existingOpportunity.setEndCustomer(opportunityDetails.getEndCustomer());
            existingOpportunity.setCategory(opportunityDetails.getCategory());
            existingOpportunity.setSubject(opportunityDetails.getSubject());
            existingOpportunity.setType(opportunityDetails.getType());
            existingOpportunity.setStatus(opportunityDetails.getStatus());

            // Save the updated opportunity
            return opportunityRepository.save(existingOpportunity);
        } else {
            // Handle case where opportunity is not found, e.g., throw an exception
            throw new RuntimeException("Opportunity not found with id " + id);
        }
    }

    // Delete an opportunity
    public void deleteOpportunity(Long id) {
        opportunityRepository.deleteById(id);
    }

    // Custom service methods based on repository methods
    public List<Opportunity> getOpportunitiesByStatus(String status) {
        return opportunityRepository.findByStatus(status);
    }

    public List<Opportunity> getOpportunitiesByPartner(String partner) {
        return opportunityRepository.findByPartner(partner);
    }
}
