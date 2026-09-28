package com.maintainit.controller;

import com.maintainit.dto.MachineDTO;
import com.maintainit.entity.Machine;
import com.maintainit.service.MachineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/machines")
@CrossOrigin
public class MachineController {

    private final MachineService machineService;

    public MachineController(MachineService machineService) {
        this.machineService = machineService;
    }

    @PostMapping
    public ResponseEntity<Machine> createMachine(
            @Valid @RequestBody MachineDTO dto) {

        Machine machine = machineService.createMachine(dto);

        return new ResponseEntity<>(
                machine,
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<Machine>> getAllMachines() {

        return ResponseEntity.ok(
                machineService.getAllMachines()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Machine> getMachineById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                machineService.getMachineById(id)
        );
    }

    @GetMapping("/{id}/maintenance-status")
    public ResponseEntity<Map<String, Object>> getMaintenanceStatus(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                machineService.getMaintenanceStatus(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Machine> updateMachine(
            @PathVariable Long id,
            @Valid @RequestBody MachineDTO dto) {

        return ResponseEntity.ok(
                machineService.updateMachine(id, dto)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMachine(
            @PathVariable Long id) {

        machineService.deleteMachine(id);

        return ResponseEntity.ok(
                "Machine deleted successfully"
        );
    }
}