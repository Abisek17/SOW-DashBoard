package com.example.SOWDashboard;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Demo {
    @GetMapping("/hello")
    public String sample()
    {
        return "Hello World";
    }
}
