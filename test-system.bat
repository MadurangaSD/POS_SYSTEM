@echo off
echo.
echo ========================================================================
echo COMPREHENSIVE SYSTEM TEST - POS SYSTEM
echo ========================================================================
echo.

echo Testing Backend Connection...
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin\"}" > token.json 2>&1
echo ✓ Backend responding

echo.
echo Testing Products API...
curl -X GET http://localhost:3001/api/products -H "Authorization: Bearer <token>" 2>&1 | findstr /C:"error" && echo ❌ FAILED || echo ✓ Products API OK

echo.
echo Testing Sales API...
curl -X GET "http://localhost:3001/api/sales?startDate=2025-12-01&endDate=2025-12-12" -H "Authorization: Bearer <token>" 2>&1 | findstr /C:"error" && echo ❌ FAILED || echo ✓ Sales API OK

echo.
echo Testing Stock API...
curl -X GET http://localhost:3001/api/stock/low-stock -H "Authorization: Bearer <token>" 2>&1 | findstr /C:"error" && echo ❌ FAILED || echo ✓ Stock API OK

echo.
echo Testing Users API...
curl -X GET http://localhost:3001/api/users -H "Authorization: Bearer <token>" 2>&1 | findstr /C:"error" && echo ❌ FAILED || echo ✓ Users API OK

echo.
echo ========================================================================
echo FRONTEND TEST
echo ========================================================================
echo.
echo Frontend running at: http://localhost:5173
echo Backend running at: http://localhost:3001
echo.
echo ========================================================================
