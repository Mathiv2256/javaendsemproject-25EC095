package com.maintainit.controller;

import com.maintainit.dto.UsageLogDTO;
import com.maintainit.entity.UsageLog;
import com.maintainit.service.UsageLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usage-logs")
@CrossOrigin
public class UsageLogController {

    private final UsageLogService usageLogService;

    public UsageLogController(UsageLogService usageLogService) {
        this.usageLogService = usageLogService;
    }

    @PostMapping
    public ResponseEntity<UsageLog> createUsageLog(
            @Valid @RequestBody UsageLogDTO dto) {

        UsageLog usageLog = usageLogService.createUsageLog(dto);

        return new ResponseEntity<>(
                usageLog,
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<UsageLog>> getAllUsageLogs() {

        return ResponseEntity.ok(
                usageLogService.getAllUsageLogs()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsageLog> getUsageLogById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                usageLogService.getUsageLogById(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUsageLog(
            @PathVariable Long id) {

        usageLogService.deleteUsageLog(id);

        return ResponseEntity.ok(
                "Usage log deleted successfully"
        );
    }
}