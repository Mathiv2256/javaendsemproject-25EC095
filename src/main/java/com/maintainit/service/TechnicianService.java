package com.maintainit.service;

import com.maintainit.dto.TechnicianDTO;
import com.maintainit.entity.Technician;
import com.maintainit.exception.ResourceNotFoundException;
import com.maintainit.repository.TechnicianRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TechnicianService {

    private final TechnicianRepository technicianRepository;

    public TechnicianService(TechnicianRepository technicianRepository) {
        this.technicianRepository = technicianRepository;
    }

    public Technician createTechnician(TechnicianDTO dto) {

        Technician technician = new Technician();

        technician.setName(dto.getName());
        technician.setEmail(dto.getEmail());
        technician.setPhone(dto.getPhone());
        technician.setSpecialization(dto.getSpecialization());

        return technicianRepository.save(technician);
    }

    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    public Technician getTechnicianById(Long id) {

        return technicianRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Technician not found with id: " + id
                        ));
    }

    public Technician updateTechnician(Long id, TechnicianDTO dto) {

        Technician technician = getTechnicianById(id);

        technician.setName(dto.getName());
        technician.setEmail(dto.getEmail());
        technician.setPhone(dto.getPhone());
        technician.setSpecialization(dto.getSpecialization());

        return technicianRepository.save(technician);
    }

    public void deleteTechnician(Long id) {

        Technician technician = getTechnicianById(id);

        technicianRepository.delete(technician);
    }
}