package com.zencoo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

/**
 * A lightweight, in-memory (single-instance) fixed-window rate limiter for the
 * auth endpoints, to blunt credential-stuffing / brute-force attempts. For a
 * multi-instance deployment, replace the in-memory map with a shared store
 * (e.g. Redis) or a gateway-level limiter.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${auth.rate-limit.max-requests:10}")
    private int maxRequests;

    @Value("${auth.rate-limit.window-seconds:60}")
    private long windowSeconds;

    private final ConcurrentHashMap<String, Window> buckets = new ConcurrentHashMap<>();

    private static final class Window {
        long windowStartMs;
        int count;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (isRateLimited(request.getRequestURI()) && !allow(clientIp(request))) {
            response.setStatus(429); // Too Many Requests
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Too many requests. Please try again later.\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(String path) {
        return "/api/auth/login".equals(path) || "/api/auth/register".equals(path);
    }

    private boolean allow(String key) {
        long now = System.currentTimeMillis();
        Window window = buckets.computeIfAbsent(key, k -> new Window());
        synchronized (window) {
            if (now - window.windowStartMs > windowSeconds * 1000L) {
                window.windowStartMs = now;
                window.count = 0;
            }
            window.count++;
            return window.count <= maxRequests;
        }
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
