package com.example.SOWDashboard;

import com.example.SOWDashboard.Opportunity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/opportunities") // Base path for all endpoints in this controller
@CrossOrigin(origins = {"http://localhost:8080","https://sow-dash-board-2huhxd3ri-abiseks-projects-56e72be1.vercel.app", "http://127.0.0.1:5501", "http://localhost:5501"}) // Allows requests from your frontend (adjust if frontend runs on a different port/domain)
public class OpportunityController {
    @Autowired // Injects the OpportunityService
    private OpportunityService opportunityService;

    // GET all opportunities
    @GetMapping
    public List<Opportunity> getAllOpportunities() {
        return opportunityService.getAllOpportunities();
    }

    // GET opportunity by ID
    @GetMapping("/{id}")
    public ResponseEntity<Opportunity> getOpportunityById(@PathVariable Long id) {
        Optional<Opportunity> opportunity = opportunityService.getOpportunityById(id);
        return opportunity.map(ResponseEntity::ok) // If opportunity is present, return 200 OK with body
                .orElseGet(() -> ResponseEntity.notFound().build()); // Else, return 404 Not Found
    }

    // POST create a new opportunity
    @PostMapping
    public ResponseEntity<Opportunity> createOpportunity(@RequestBody Opportunity opportunity) {
        Opportunity createdOpportunity = opportunityService.createOpportunity(opportunity);
        return new ResponseEntity<>(createdOpportunity, HttpStatus.CREATED); // Return 201 Created
    }

    // PUT update an existing opportunity
    @PutMapping("/{id}")
    public ResponseEntity<Opportunity> updateOpportunity(@PathVariable Long id, @RequestBody Opportunity opportunityDetails) {
        try {
            Opportunity updatedOpportunity = opportunityService.updateOpportunity(id, opportunityDetails);
            return ResponseEntity.ok(updatedOpportunity); // Return 200 OK with updated body
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // Return 404 Not Found if not found
        }
    }

    // DELETE an opportunity
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteOpportunity(@PathVariable Long id) {
        try {
            opportunityService.deleteOpportunity(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Return 204 No Content on successful deletion
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR); // Handle errors
        }
    }

    // Example of custom endpoint: GET opportunities by status
    @GetMapping("/status/{status}")
    public List<Opportunity> getOpportunitiesByStatus(@PathVariable String status) {
        return opportunityService.getOpportunitiesByStatus(status);
    }

    // Example of custom endpoint: GET opportunities by partner
    @GetMapping("/partner/{partner}")
    public List<Opportunity> getOpportunitiesByPartner(@PathVariable String partner) {
        return opportunityService.getOpportunitiesByPartner(partner);
    }
}

