# Single command to build and run the entire BrainBolt stack
cd "C:\Users\Vikas\OneDrive\Desktop\Brain_bolt"; docker-compose ps; docker ps --format "table {{.Names}}\t{{.Ports}}"; Write-Host "Frontend: http://localhost:3000`nBackend: http://localhost:4000"; docker-compose logs --tail 200 --follow backend frontend
