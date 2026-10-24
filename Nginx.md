# Nginx Setup Guide

> [!WARNING]
>
> ### Exact configuration may differ based on your OS or distro

## Linux (based on Debian)

> [!WARNING]
> Other distros may and most likely will have diffrent configuration directories or need diffrent tools.

### Requirements:

- Nginx (`sudo apt install nginx`)
- Any text editor (preferably termainal based or with ability to write with sudo privileges)
- mkcert\* (SSL Certificates for local development)
- certbot\* (SSL Certificates for hosting)

\* - optional, but without SSL Certificates the config will need some tweaking. Choose one based on usecase.

### Nginx config:

- Go to `/etc/nginx/`
- Create `conf.d` and `certs` directories.
- `/etc/nginx/nginx.conf` needs to have this:

```
# If you know how to use nginx feel free to tweak most of these values.
worker_processes  1;

events {
}

http {
    include /etc/nginx/conf.d/*.conf; # This is the most important part.
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;

    keepalive_timeout  65;

    server {
        listen       80;
        server_name  localhost;
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }

    }

}
```

- Create a `app.conf` file in the `/etc/conf.d/` directory. "App" can be changed to any file name if needed.

- `app.conf` needs to have this:

```
server {
    listen 80;
    server_name domain.com www.domain.com; # Change this to your domain or "localhost"

    return 301 https://$host$request_uri;
}


server {
    listen 443 ssl;
    server_name domain.com www.domain.com; # Again your domain or "localhost", both must match.

    # Paths to your SSL certificates
    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

}
```

- Don't wory about SSL certificates, this guide will help you with that later on.

- Make sure to change domain.com and www.domain.com to your domain and www.<b>_yourdomain_</b>

- Now we should be ready, we can restart nginx to apply this config. `sudo systemctl reload nginx`

- (If you din't have nginx on just enter `sudo systemctl enable --now nginx`)

### SSL Certificates (optional, but recommended)

#### mkcert (local development):

- Open terminal in previously created `/etc/nginx/certs/`.
- Enter this command `mkcert -install`
- Run `mkcert -key-file privkey.pem -cert-file fullchain.pem localhost 127.0.0.1`
- You can restart nginx again to make it read those certificates. Make sure that certificates are in the `/etc/nginx/certs/` directory.

#### certbot

- Open terminal in previously created `/etc/nginx/certs/`.
- Run `sudo certbot certonly --standalone -d *domain*`. Make sure to change \*domain\* to your domain.
- You can restart nginx again to make it read those certificates. Make sure that certificates are in the `/etc/nginx/certs/` directory.

Now, if you started the frontend and backend servers, you should be able to play on https://localhost or https://yourdomain.me.

<span style="color: #ff2828; text-align: center;">

[!WARNING]

### ⚠️ SOME DISTROS NEED THIS COMMAND TO LET NGINX SERVE HTTPS ⚠️

`sudo setsebool -P httpd_can_network_connect 1`

</span>
