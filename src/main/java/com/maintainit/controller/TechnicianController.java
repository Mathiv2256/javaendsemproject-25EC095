package com.maintainit.controller;

import com.maintainit.dto.TechnicianDTO;
import com.maintainit.entity.Technician;
import com.maintainit.service.TechnicianService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@CrossOrigin
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(TechnicianService technicianService) {
        this.technicianService = technicianService;
    }

    @PostMapping
    public ResponseEntity<Technician> createTechnician(
            @Valid @RequestBody TechnicianDTO dto) {

        Technician technician = technicianService.createTechnician(dto);

        return new ResponseEntity<>(
                technician,
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<Technician>> getAllTechnicians() {

        return ResponseEntity.ok(
                technicianService.getAllTechnicians()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Technician> getTechnicianById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                technicianService.getTechnicianById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Technician> updateTechnician(
            @PathVariable Long id,
            @Valid @RequestBody TechnicianDTO dto) {

        return ResponseEntity.ok(
                technicianService.updateTechnician(id, dto)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTechnician(
            @PathVariable Long id) {

        technicianService.deleteTechnician(id);

        return ResponseEntity.ok(
                "Technician deleted successfully"
        );
    }
}