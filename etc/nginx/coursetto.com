# Coursetto
################################################################################
server {
	listen 80;

	server_name coursetto.mndktchn.com;
	proxy_intercept_errors on;

	location / {
		proxy_set_header X-Real-IP $remote_addr;
		proxy_pass http://localhost:4210/;
		error_page 404 = @fallback;
	}
	
	location @fallback {
		rewrite ^(.+)$ /index.html last;
		proxy_pass http://localhost:4210;
	}

	location /api/v1/ {
		proxy_set_header X-Real-IP $remote_addr;
		proxy_pass http://localhost:4220/;
	}

	gzip on;
	gzip_min_length 1000;
	gzip_types text/css text/plain text/javascript application/javascript application/x-javascript application/json application/xml;
}

# Old EnrollGo Seutp
################################################################################
server {
	listen 80;

	server_name enrollgo.mndktchn.com;

	location / {
		proxy_pass http://localhost:4210/;
		proxy_set_header X-Real-IP $remote_addr;
	}

	location /api/v1/ {
		proxy_pass http://localhost:4220/;
		proxy_set_header X-Real-IP $remote_addr;
	}

	gzip on;
	gzip_min_length 1000;
	gzip_types text/css text/plain text/javascript application/javascript application/x-javascript application/json application/xml;
}
