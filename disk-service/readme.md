```bash
docker run \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio1 \
  -v ~/minio/data:/data \
  -e "MINIO_ROOT_USER=AKIAIOSFODNN7EXAMPLE" \
  -e "MINIO_ROOT_PASSWORD=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" \
  quay.io/minio/minio server /data --console-address ":9001"
```

```bash
docker run -d --name yugabyte \
  -p7000:7000 -8990:9000 -p5433:5433 -p9042:9042 \
  -v ~/yb_data:/home/yugabyte/yb_data \
  yugabytedb/yugabyte:latest bin/yugabyted start \
  --base_dir=/home/yugabyte/yb_data --daemon=false
```
