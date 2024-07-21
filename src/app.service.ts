import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
    index() {
        return { success:true };
    }
}
