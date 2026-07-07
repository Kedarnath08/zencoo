package com.zencoo.controller;

import com.zencoo.service.ResidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/residents")
public class ResidentController {

    @Autowired
    private ResidentService residentService;

    @GetMapping
    public ResponseEntity<?> getResidents(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestParam(required = false) String wing,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(residentService.getResidents(userId, wing, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResident(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long id
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(residentService.getResident(id, userId));
    }
}
