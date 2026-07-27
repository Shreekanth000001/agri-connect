#!/bin/bash

BASE_URL="http://localhost:8000"

echo "### 1. Auth Flow"

# a)
RES_A=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username":"buyer2@agriconnect.com","password":"password"}')
STATUS_A=$(echo "$RES_A" | tail -n1)
BODY_A=$(echo "$RES_A" | sed '$d')
echo "a) POST /api/v1/auth/login (buyer2 JSON)"
echo "Status: $STATUS_A"
echo "Body: $BODY_A"
TOKEN_BUYER2=$(echo "$BODY_A" | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$')
echo ""

# b)
RES_B=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username":"farmer7@agriconnect.com","password":"password"}')
STATUS_B=$(echo "$RES_B" | tail -n1)
BODY_B=$(echo "$RES_B" | sed '$d')
echo "b) POST /api/v1/auth/login (farmer7 JSON)"
echo "Status: $STATUS_B"
echo "Body: $BODY_B"
TOKEN_FARMER7=$(echo "$BODY_B" | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$')
echo ""

# c)
RES_C=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username":"buyer2@agriconnect.com","password":"wrongpassword"}')
STATUS_C=$(echo "$RES_C" | tail -n1)
echo "c) POST /api/v1/auth/login (wrong password)"
echo "Status: $STATUS_C"
echo "Body: $(echo "$RES_C" | sed '$d')"
echo ""

# d)
RES_D=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d 'username=buyer2@agriconnect.com&password=password')
STATUS_D=$(echo "$RES_D" | tail -n1)
echo "d) POST /api/v1/auth/login (buyer2 form data)"
echo "Status: $STATUS_D"
echo "Body: $(echo "$RES_D" | sed '$d')"
echo ""

echo "### 2. User Identity"

# e)
RES_E=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/users/me" \
     -H "Authorization: Bearer $TOKEN_BUYER2")
STATUS_E=$(echo "$RES_E" | tail -n1)
echo "e) GET /api/v1/users/me (buyer2 token)"
echo "Status: $STATUS_E"
echo "Body: $(echo "$RES_E" | sed '$d')"
echo ""

# f)
RES_F=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/users/me" \
     -H "Authorization: Bearer $TOKEN_FARMER7")
STATUS_F=$(echo "$RES_F" | tail -n1)
echo "f) GET /api/v1/users/me (farmer7 token)"
echo "Status: $STATUS_F"
echo "Body: $(echo "$RES_F" | sed '$d')"
echo ""

# g)
RES_G=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/users/me")
STATUS_G=$(echo "$RES_G" | tail -n1)
echo "g) GET /api/v1/users/me (NO token)"
echo "Status: $STATUS_G"
echo "Body: $(echo "$RES_G" | sed '$d')"
echo ""

echo "### 3. Chat Conversations"

# h)
RES_H=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/chat/conversations" \
     -H "Authorization: Bearer $TOKEN_FARMER7")
STATUS_H=$(echo "$RES_H" | tail -n1)
echo "h) GET /api/v1/chat/conversations (farmer7)"
echo "Status: $STATUS_H"
echo "Body: $(echo "$RES_H" | sed '$d')"
echo ""

# i)
RES_I=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/chat/conversations" \
     -H "Authorization: Bearer $TOKEN_BUYER2")
STATUS_I=$(echo "$RES_I" | tail -n1)
echo "i) GET /api/v1/chat/conversations (buyer2)"
echo "Status: $STATUS_I"
echo "Body: $(echo "$RES_I" | sed '$d')"
echo ""

# get buyer1 token
RES_B1=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username":"buyer1@agriconnect.com","password":"password"}')
TOKEN_BUYER1=$(echo "$RES_B1" | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$')

# j)
RES_J=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/chat/conversations" \
     -H "Authorization: Bearer $TOKEN_BUYER1")
STATUS_J=$(echo "$RES_J" | tail -n1)
echo "j) GET /api/v1/chat/conversations (buyer1)"
echo "Status: $STATUS_J"
echo "Body: $(echo "$RES_J" | sed '$d')"
echo ""

echo "### 5. Edge Cases"

# l)
RES_L=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{}')
STATUS_L=$(echo "$RES_L" | tail -n1)
echo "l) POST /api/v1/auth/login (empty body)"
echo "Status: $STATUS_L"
echo "Body: $(echo "$RES_L" | sed '$d')"
echo ""

# m)
RES_M=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/chat/conversations" \
     -H "Authorization: Bearer invalid_token_123")
STATUS_M=$(echo "$RES_M" | tail -n1)
echo "m) GET /api/v1/chat/conversations (invalid token)"
echo "Status: $STATUS_M"
echo "Body: $(echo "$RES_M" | sed '$d')"
echo ""
