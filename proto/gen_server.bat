set protoPath=../server

node .\node_modules\protobufjs\bin\pbjs -t static -o %protoPath%/src/proto/protobuf/proto.js ./proto/*.proto --force-number
node .\node_modules\protobufjs\bin\pbts --no-comments -o %protoPath%/src/proto/protobuf/proto.js.d.ts %protoPath%/src/proto/protobuf/proto.js
node .\node_modules\protobufjs\bin\pbjs --no-comments -t static -o %protoPath%/src/proto/protobuf/proto.js ./proto/*.proto --force-number
node replaceTxt2 %protoPath%

node .\node_modules\protobufjs\bin\pbjs -t static -o %protoPath%/src/proto/protobuf/bgproto.js ./proto/Background/*.proto --force-number
node .\node_modules\protobufjs\bin\pbts --no-comments -o %protoPath%/src/proto/protobuf/bgproto.js.d.ts %protoPath%/src/proto/protobuf/bgproto.js
node .\node_modules\protobufjs\bin\pbjs --no-comments -t static -o %protoPath%/src/proto/protobuf/bgproto.js ./proto/Background/*.proto --force-number

node replaceTxt4 %protoPath%

node copyFile.js 1 %protoPath%/src/proto/protobuf %protoPath%/dist/proto/protobuf

node .\Generator\dist\GenNewServer.js 

pause