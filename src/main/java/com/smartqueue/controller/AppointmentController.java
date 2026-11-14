
package com.smartqueue.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartqueue.entity.Appointment;
import com.smartqueue.service.AppointmentService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // BOOK APPOINTMENT
    @PostMapping
    public Appointment bookAppointment(@RequestBody Appointment appointment) {
        return appointmentService.bookAppointment(appointment);
    }

    // GET ALL APPOINTMENTS
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    // GET APPOINTMENT BY ID
    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id);
    }

    // TRACK APPOINTMENT
    @GetMapping("/track/{tokenNumber}")
    public Appointment trackAppointment(@PathVariable String tokenNumber) {
        return appointmentService.getAppointmentByToken(tokenNumber);
    }

    // GET QUEUE STATUS
    @GetMapping("/queue-status/{tokenNumber}")
    public ResponseEntity<Map<String, Object>> getQueueStatus(
            @PathVariable String tokenNumber) {

        Map<String, Object> queueStatus =
                appointmentService.getQueueStatus(tokenNumber);

        if (queueStatus == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(queueStatus);
    }

    // UPDATE APPOINTMENT STATUS
    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        if (!status.equalsIgnoreCase("WAITING")
                && !status.equalsIgnoreCase("SERVING")
                && !status.equalsIgnoreCase("COMPLETED")) {

            return ResponseEntity.badRequest().build();
        }

        Appointment updated =
                appointmentService.updateAppointmentStatus(id, status);

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updated);
    }
}
