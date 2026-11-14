
package com.smartqueue.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.smartqueue.entity.Appointment;
import com.smartqueue.repository.AppointmentRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    // BOOK APPOINTMENT
    public Appointment bookAppointment(Appointment appointment) {

        appointment.setStatus("WAITING");

        // Generate queue token if one does not exist
        if (appointment.getTokenNumber() == null
                || appointment.getTokenNumber().isBlank()) {

            String token = "SQ-" +
                    UUID.randomUUID()
                    .toString()
                    .substring(0, 6)
                    .toUpperCase();

            appointment.setTokenNumber(token);
        }

        return appointmentRepository.save(appointment);
    }

    // GET ALL APPOINTMENTS
    public List<Appointment> getAllAppointments() {

        return appointmentRepository.findAll();
    }

    // GET APPOINTMENT BY ID
    public Appointment getAppointmentById(Long id) {

        return appointmentRepository.findById(id).orElse(null);
    }

    // GET APPOINTMENT BY TOKEN
    public Appointment getAppointmentByToken(String tokenNumber) {

        return appointmentRepository
                .findByTokenNumber(tokenNumber)
                .orElse(null);
    }

    // GET QUEUE STATUS
    public Map<String, Object> getQueueStatus(String tokenNumber) {

        Appointment appointment = getAppointmentByToken(tokenNumber);

        if (appointment == null) {
            return null;
        }

        long peopleAhead = 0;

        if ("WAITING".equalsIgnoreCase(appointment.getStatus())
                && appointment.getAppointmentDate() != null
                && appointment.getAppointmentTime() != null) {

            peopleAhead = appointmentRepository.countPeopleAhead(
                    appointment.getAppointmentDate(),
                    appointment.getServiceType(),
                    appointment.getAppointmentTime(),
                    appointment.getId()
            );
        }

        Map<String, Object> response = new HashMap<>();

        response.put("tokenNumber", appointment.getTokenNumber());
        response.put("customerName", appointment.getCustomerName());
        response.put("status", appointment.getStatus());

        // Keep frontend-compatible response keys
        response.put("service", appointment.getServiceType());
        response.put("date", appointment.getAppointmentDate());
        response.put("time", appointment.getAppointmentTime());

        response.put("serviceType", appointment.getServiceType());
        response.put("appointmentDate", appointment.getAppointmentDate());
        response.put("appointmentTime", appointment.getAppointmentTime());

        response.put("peopleAhead", peopleAhead);
        response.put("estimatedWait", peopleAhead * 10);

        return response;
    }

    // UPDATE APPOINTMENT STATUS
    public Appointment updateAppointmentStatus(Long id, String status) {

        Appointment appointment = getAppointmentById(id);

        if (appointment == null) {
            return null;
        }

        String currentStatus = appointment.getStatus();

        // WAITING -> SERVING
        if ("WAITING".equalsIgnoreCase(currentStatus)
                && "SERVING".equalsIgnoreCase(status)) {

            appointment.setStatus("SERVING");

        }

        // SERVING -> COMPLETED
        else if ("SERVING".equalsIgnoreCase(currentStatus)
                && "COMPLETED".equalsIgnoreCase(status)) {

            appointment.setStatus("COMPLETED");

        }

        // Do not allow invalid status transitions
        else {
            return appointment;
        }

        return appointmentRepository.save(appointment);
    }
}
